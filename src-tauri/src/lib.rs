use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use chrono::Local;
use image::{codecs::jpeg::JpegEncoder, imageops::FilterType, DynamicImage, ImageFormat};
use std::io::Cursor;
use std::sync::Arc;
use tauri::{Emitter, Manager, State, Window};
use tokio::sync::Mutex;

const MAX_STREAM_WIDTH: u32 = 800;
const JPEG_QUALITY: u8 = 80; // Lower quality for faster streaming
const BUFFER_CAPACITY: usize = 512 * 1024; // 512KB initial buffer

#[derive(Default, Clone)]
pub struct StreamState {
    running: Arc<Mutex<bool>>,
}

#[derive(Default)]
struct ImageState(Arc<Mutex<Option<DynamicImage>>>);

#[derive(Debug, Clone, serde::Serialize)]
pub struct ScanProgress {
    ip: String,
    port: u16,
    total_scanned: u32,
    total_to_scan: u32,
}

#[derive(Clone, serde::Serialize)]
struct StreamUpdate {
    error: Option<String>,
    processing_time_ms: u64,
    image_data: Option<String>,
}

#[derive(Clone, serde::Serialize)]
struct PortFound {
    ip: String,
    port: u16,
    service_hint: String,
}

fn image_to_base64(img: &DynamicImage) -> Result<String, String> {
    let mut buffer = Vec::with_capacity(BUFFER_CAPACITY);
    let mut cursor = Cursor::new(&mut buffer);

    // Only resize if needed
    let img = if img.width() > MAX_STREAM_WIDTH {
        let scale = MAX_STREAM_WIDTH as f32 / img.width() as f32;
        let new_height = (img.height() as f32 * scale) as u32;
        img.resize_exact(MAX_STREAM_WIDTH, new_height, FilterType::Nearest)
    } else {
        img.clone()
    };

    // Use JPEG with custom quality setting
    let mut encoder = JpegEncoder::new_with_quality(&mut cursor, JPEG_QUALITY);
    encoder
        .encode(
            img.as_bytes(),
            img.width(),
            img.height(),
            img.color().into(),
        )
        .map_err(|e| format!("Failed to encode image: {}", e))?;

    Ok(BASE64.encode(&buffer))
}

fn get_service_hint(port: u16) -> String {
    match port {
        20 => "FTP Data",
        21 => "FTP Control",
        22 => "SSH",
        23 => "Telnet",
        25 => "SMTP",
        53 => "DNS",
        80 => "HTTP",
        110 => "POP3",
        143 => "IMAP",
        443 => "HTTPS",
        445 => "SMB",
        554 => "RTSP",
        1883 => "MQTT",
        3306 => "MySQL",
        3389 => "RDP",
        4747 => "IP Camera",
        5432 => "PostgreSQL",
        8080 => "HTTP Alt/Camera",
        8081 => "HTTP Alt/Camera",
        8082 => "HTTP Alt/Camera",
        8443 => "HTTPS Alt",
        _ => "Unknown",
    }
    .to_string()
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

    // Create an optimized HTTP client
    let client = reqwest::Client::builder()
        .pool_idle_timeout(None)
        .pool_max_idle_per_host(1)
        .tcp_keepalive(Some(std::time::Duration::from_secs(30)))
        .tcp_nodelay(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    tauri::async_runtime::spawn(async move {
        let mut consecutive_errors = 0;
        let mut last_frame_time = std::time::Instant::now();

        while *running.lock().await {
            let frame_start = std::time::Instant::now();

            // Skip frame if we're too early (maintain 10 FPS)
            let elapsed_since_last = last_frame_time.elapsed().as_millis();
            if elapsed_since_last < 100 {
                tokio::time::sleep(std::time::Duration::from_millis(5)).await;
                continue;
            }

            match client.get(&url).send().await {
                Ok(response) => {
                    match response.bytes().await {
                        Ok(image_data) => {
                            match image::load_from_memory(&image_data) {
                                Ok(img) => {
                                    // Store original image for capture
                                    let mut state = state.lock().await;
                                    *state = Some(img.clone());
                                    drop(state); // Release lock early

                                    let processing_time = frame_start.elapsed().as_millis() as u64;

                                    match image_to_base64(&img) {
                                        Ok(base64_data) => {
                                            consecutive_errors = 0;
                                            last_frame_time = frame_start;

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
    // Reuse client configuration from streaming
    let client = reqwest::Client::builder()
        .tcp_nodelay(true)
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

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

        // Preallocate buffer for PNG
        let mut buffer = Vec::with_capacity(img.width() as usize * img.height() as usize * 4);
        let mut cursor = Cursor::new(&mut buffer);

        img.write_to(&mut cursor, ImageFormat::Png)
            .map_err(|e| format!("Error saving image: {}", e))?;

        std::fs::write(&filename, buffer).map_err(|e| format!("Error saving image: {}", e))?;

        Ok(format!("Saved scan as {}", filename))
    } else {
        Err("No image captured".to_string())
    }
}

#[tauri::command]
async fn scan_network(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let mut found_cameras = Vec::new();
    // Common ports to scan
    let ports = vec![
        20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 554, 1883, 3306, 3389, 4747, 5432, 8080,
        8081, 8082, 8443,
    ];
    let total_to_scan = 254 * ports.len();
    let total_scanned = Arc::new(Mutex::new(0u32));

    // Create multiple concurrent scan tasks
    let mut tasks = Vec::new();

    for i in 1..255 {
        let ip = format!("192.168.1.{}", i);

        for &port in &ports {
            let ip = ip.clone();
            let app_handle = app_handle.clone();
            let total_scanned = total_scanned.clone();

            let task = tokio::spawn(async move {
                let current_scanned = {
                    let mut count = total_scanned.lock().await;
                    *count += 1;
                    *count
                };

                let progress = ScanProgress {
                    ip: ip.clone(),
                    port,
                    total_scanned: current_scanned,
                    total_to_scan: total_to_scan as u32,
                };

                // Emit progress event
                app_handle
                    .emit("scan-progress", progress)
                    .unwrap_or_default();

                // Try to connect with a short timeout
                let addr = format!("{}:{}", ip, port);
                if let Ok(Ok(_)) = tokio::time::timeout(
                    std::time::Duration::from_millis(50),
                    tokio::net::TcpStream::connect(&addr),
                )
                .await
                {
                    // Found an open port
                    let port_found = PortFound {
                        ip: ip.clone(),
                        port,
                        service_hint: get_service_hint(port),
                    };

                    // Emit port found event
                    app_handle
                        .emit("port-found", port_found)
                        .unwrap_or_default();

                    // If it's a potential camera port, add it to the list
                    if matches!(port, 80 | 8080 | 4747 | 554 | 8081 | 8082) {
                        Some(vec![format!("http://{}:{}", ip, port)])
                    } else {
                        None
                    }
                } else {
                    None
                }
            });
            tasks.push(task);
        }
    }

    // Wait for all tasks to complete
    for task in tasks {
        if let Ok(Some(urls)) = task.await {
            found_cameras.extend(urls);
        }
    }

    Ok(found_cameras)
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
            stop_stream,
            scan_network
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
