import Foundation
import Vision
import AppKit
import CoreImage

let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let poses: [String: [String: [Double]]] = CommandLine.arguments.count > 3
    ? (try JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[3]))) as? [String: [String: [Double]]] ?? [:])
    : [:]
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)
let context = CIContext(options: [.useSoftwareRenderer: false])
let request = VNGenerateForegroundInstanceMaskRequest()
let files = try FileManager.default.contentsOfDirectory(at: input, includingPropertiesForKeys: nil)
    .filter { $0.pathExtension == "png" }.sorted { $0.lastPathComponent < $1.lastPathComponent }
for (index, file) in files.enumerated() {
    try autoreleasepool {
        let handler = VNImageRequestHandler(url: file)
        try handler.perform([request])
        guard let observation = request.results?.first else { return }
        var selected = observation.allInstances
        if let points = poses[file.lastPathComponent] {
            var best = -1.0
            var main: Int? = nil
            var accessories = IndexSet()
            for instance in observation.allInstances {
                let candidate = try observation.generateScaledMaskForImage(forInstances: IndexSet(integer: instance), from: handler)
                let ci = CIImage(cvPixelBuffer: candidate)
                guard let cg = context.createCGImage(ci, from: ci.extent) else { continue }
                let bitmap = NSBitmapImageRep(cgImage: cg)
                func value(_ point: [Double]) -> Double {
                    let x = min(bitmap.pixelsWide - 1, max(0, Int(point[0] * Double(bitmap.pixelsWide))))
                    let y = min(bitmap.pixelsHigh - 1, max(0, Int(point[1] * Double(bitmap.pixelsHigh))))
                    return Double(bitmap.colorAt(x: x, y: y)?.usingColorSpace(.deviceRGB)?.redComponent ?? 0)
                }
                var score = 0.0
                for name in ["root", "neck_1_joint", "head_joint"] {
                    if let point = points[name], point[2] > 0.1 { score += value(point) }
                }
                if score > best { best = score; main = instance }
                if let point = points["accessory_seed"], value(point) > 0.5 { accessories.insert(instance) }
            }
            if let main = main { selected = accessories; selected.insert(main) }
        }
        let mask = try observation.generateScaledMaskForImage(forInstances: selected, from: handler)
        let image = CIImage(cvPixelBuffer: mask)
        guard let cg = context.createCGImage(image, from: image.extent) else { return }
        let bitmap = NSBitmapImageRep(cgImage: cg)
        let data = bitmap.representation(using: .png, properties: [:])!
        try data.write(to: output.appendingPathComponent(file.lastPathComponent))
    }
    if index % 15 == 0 { print("segmented \(index + 1)/\(files.count)"); fflush(stdout) }
}
