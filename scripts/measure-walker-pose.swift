import Foundation
import Vision
let input = URL(fileURLWithPath: CommandLine.arguments[1])
let output = URL(fileURLWithPath: CommandLine.arguments[2])
let files = try FileManager.default.contentsOfDirectory(at: input, includingPropertiesForKeys: nil).filter { $0.pathExtension == "png" }.sorted { $0.lastPathComponent < $1.lastPathComponent }
var result = [String: [String: [Double]]]()
for file in files {
    try autoreleasepool {
        let request = VNDetectHumanBodyPoseRequest()
        try VNImageRequestHandler(url: file).perform([request])
        guard let obs = request.results?.max(by: { $0.confidence < $1.confidence }) else { return }
        var points = [String: [Double]]()
        for (name, point) in try obs.recognizedPoints(.all) {
            points[name.rawValue.rawValue] = [point.x, 1 - point.y, Double(point.confidence)]
        }
        result[file.lastPathComponent] = points
    }
}
try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys]).write(to: output)
print("poses: \(result.count)")
