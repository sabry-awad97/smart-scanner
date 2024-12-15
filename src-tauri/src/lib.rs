use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use chrono::Local;
use image::{imageops::FilterType, DynamicImage, GenericImageView, ImageFormat};
use std::io::Cursor;
use std::sync::Arc;
use tauri::{Emitter, Manager, State, Window};
use tokio::sync::Mutex;

const MAX_STREAM_WIDTH: u32 = 800; // Limit stream resolution for performance

#[derive(Default, Clone)]
pub struct StreamState {
    running: Arc<Mutex<bool>>,
}

#[derive(Default)]
struct ImageState(Arc<Mutex<Option<DynamicImage>>>);

#[derive(Clone, serde::Serialize)]
struct StreamUpdate {
    error: Option<String>,
    processing_time_ms: u64,
    image_data: Option<String>,
}

fn image_to_base64(img: &DynamicImage) -> Result<String, String> {
    let mut buffer = Vec::with_capacity(1024 * 1024); // Preallocate 1MB
    let mut cursor = Cursor::new(&mut buffer);

    // Resize image if it's too large
    let (width, height) = img.dimensions();
    let img = if width > MAX_STREAM_WIDTH {
        let scale = MAX_STREAM_WIDTH as f32 / width as f32;
        let new_height = (height as f32 * scale) as u32;
        img.resize(MAX_STREAM_WIDTH, new_height, FilterType::Triangle)
    } else {
        img.clone()
    };

    // Use JPEG with lower quality for streaming
    img.write_to(&mut cursor, ImageFormat::Jpeg)
        .map_err(|e| format!("Failed to encode image: {}", e))?;
    Ok(BASE64.encode(&buffer))
}

#[tauri::command]
async fn start_stream(
    window: Window,
    state: State<'_, ImageState>,
    url: String,
) -> Result<(), String> {
    let stream_state = StreamState {
        running: Arc::new(Mutex::new(true)),
    };

    window.manage(stream_state.clone());
    let state = state.0.clone();
    let running = stream_state.running.clone();

    println!("Starting stream from URL: {}", url);

    // Create a reusable client for better performance
    let client = reqwest::Client::builder()
        .pool_idle_timeout(None)
        .pool_max_idle_per_host(1)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    tauri::async_runtime::spawn(async move {
        let mut consecutive_errors = 0;

        while *running.lock().await {
            let start = std::time::Instant::now();

            match client.get(&url).send().await {
                Ok(response) => {
                    match response.bytes().await {
                        Ok(image_data) => {
                            match image::load_from_memory(&image_data) {
                                Ok(img) => {
                                    // Store original image for capture
                                    let mut state = state.lock().await;
                                    *state = Some(img.clone());

                                    let processing_time = start.elapsed().as_millis() as u64;

                                    match image_to_base64(&img) {
                                        Ok(base64_data) => {
                                            consecutive_errors = 0;
                                            let _ = window.emit(
                                                "stream-update",
                                                StreamUpdate {
                                                    error: None,
                                                    processing_time_ms: processing_time,
                                                    image_data: Some(base64_data),
                                                },
                                            );
                                        }
                                        Err(e) => {
                                            consecutive_errors += 1;
                                            eprintln!("Failed to convert image to base64: {}", e);
                                            let _ = window.emit(
                                                "stream-update",
                                                StreamUpdate {
                                                    error: Some(format!(
                                                        "Failed to convert image: {}",
                                                        e
                                                    )),
                                                    processing_time_ms: 0,
                                                    image_data: None,
                                                },
                                            );
                                        }
                                    }
                                }
                                Err(e) => {
                                    consecutive_errors += 1;
                                    eprintln!("Failed to load image: {}", e);
                                    let _ = window.emit(
                                        "stream-update",
                                        StreamUpdate {
                                            error: Some(format!("Failed to load image: {}", e)),
                                            processing_time_ms: 0,
                                            image_data: None,
                                        },
                                    );
                                }
                            }
                        }
                        Err(e) => {
                            consecutive_errors += 1;
                            eprintln!("Failed to get image bytes: {}", e);
                            let _ = window.emit(
                                "stream-update",
                                StreamUpdate {
                                    error: Some(format!("Failed to get image bytes: {}", e)),
                                    processing_time_ms: 0,
                                    image_data: None,
                                },
                            );
                        }
                    }
                }
                Err(e) => {
                    consecutive_errors += 1;
                    eprintln!("Failed to fetch image: {}", e);
                    let _ = window.emit(
                        "stream-update",
                        StreamUpdate {
                            error: Some(format!("Failed to fetch image: {}", e)),
                            processing_time_ms: 0,
                            image_data: None,
                        },
                    );
                }
            }

            // Exponential backoff on errors
            if consecutive_errors > 0 {
                let delay = std::cmp::min(1000, 100 * (1 << consecutive_errors));
                tokio::time::sleep(std::time::Duration::from_millis(delay as u64)).await;
                continue;
            }

            // Maintain target frame rate (10 FPS) but don't wait if we're already slower
            let elapsed = start.elapsed().as_millis();
            if elapsed < 100 {
                // 10 FPS = 100ms per frame
                tokio::time::sleep(std::time::Duration::from_millis(100 - elapsed as u64)).await;
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn stop_stream(window: Window) -> Result<(), String> {
    if let Some(stream_state) = window.try_state::<StreamState>() {
        let mut running = stream_state.running.lock().await;
        *running = false;
        Ok(())
    } else {
        Err("Stream not running".to_string())
    }
}

#[tauri::command]
async fn capture_image(state: State<'_, ImageState>, url: String) -> Result<String, String> {
    let client = reqwest::Client::new();

    match client.get(&url).send().await {
        Ok(response) => {
            if let Ok(image_data) = response.bytes().await {
                if let Ok(img) = image::load_from_memory(&image_data) {
                    let mut state = state.0.lock().await;
                    *state = Some(img);
                    Ok("Image captured successfully".to_string())
                } else {
                    Err("Failed to load image data".to_string())
                }
            } else {
                Err("Failed to get image bytes".to_string())
            }
        }
        Err(e) => Err(format!("Failed to fetch image: {}", e)),
    }
}

#[tauri::command]
async fn save_image(state: State<'_, ImageState>) -> Result<String, String> {
    let captured = state.0.lock().await;
    if let Some(img) = &*captured {
        let timestamp = Local::now().format("%Y-%m-%d-%H-%M-%S").to_string();
        let filename = format!("{}.png", timestamp);
        let mut buffer = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        img.write_to(&mut cursor, ImageFormat::Png)
            .map_err(|e| format!("Error saving image: {}", e))?;
        std::fs::write(&filename, buffer).map_err(|e| format!("Error saving image: {}", e))?;
        Ok(format!("Saved scan as {}", filename))
    } else {
        Err("No image captured".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ImageState::default())
        .invoke_handler(tauri::generate_handler![
            capture_image,
            save_image,
            start_stream,
            stop_stream
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
