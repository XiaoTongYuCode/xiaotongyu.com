import Foundation
import Vision
import AppKit
import CoreImage

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let context = CIContext(options: [.useSoftwareRenderer: false])
let request = VNGeneratePersonSegmentationRequest()
request.qualityLevel = .accurate
request.outputPixelFormat = kCVPixelFormatType_OneComponent8
let files = try FileManager.default.contentsOfDirectory(at: input, includingPropertiesForKeys: nil)
    .filter { $0.pathExtension == "png" }.sorted { $0.lastPathComponent < $1.lastPathComponent }
for (index, file) in files.enumerated() {
    try autoreleasepool {
        let handler = VNImageRequestHandler(url: file)
        try handler.perform([request])
        guard let mask = request.results?.first?.pixelBuffer else { return }
        let image = CIImage(cvPixelBuffer: mask)
        guard let cg = context.createCGImage(image, from: image.extent) else { return }
        let bitmap = NSBitmapImageRep(cgImage: cg)
        let data = bitmap.representation(using: .png, properties: [:])!
        try data.write(to: output.appendingPathComponent(file.lastPathComponent))
    }
    if index % 15 == 0 { print("segmented \(index + 1)/\(files.count)"); fflush(stdout) }
}
