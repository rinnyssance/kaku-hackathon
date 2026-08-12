
import { useEffect, useRef, useState } from "react";
import type { KanjiContent, Stroke, StrokePoint } from "../shared/contracts";
import { normalizePoint, validateWriting, type WritingFeedback } from "./lib/writing";

interface PracticeCanvasProps {
  content: KanjiContent;
  onResult: (feedback: WritingFeedback, hintsUsed: number) => void;
}

export function PracticeCanvas({ content, onResult }: PracticeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);

  useEffect(() => {
    setStrokes([]);
    setActiveStroke(null);
    setHintLevel(0);
    setFeedback(null);
  }, [content.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    context.scale(ratio, ratio);
    context.clearRect(0, 0, rect.width, rect.height);

    context.strokeStyle = "rgba(47,43,40,.1)";
    context.lineWidth = 1;
    for (let index = 1; index < 4; index += 1) {
      const position = (rect.width / 4) * index;
      context.beginPath();
      context.moveTo(position, 0);
      context.lineTo(position, rect.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, position);
      context.lineTo(rect.width, position);
      context.stroke();
    }
    context.setLineDash([7, 7]);
    context.strokeStyle = "rgba(47,43,40,.18)";
    context.beginPath();
    context.moveTo(rect.width / 2, 0);
    context.lineTo(rect.width / 2, rect.height);
    context.moveTo(0, rect.height / 2);
    context.lineTo(rect.width, rect.height / 2);
    context.stroke();
    context.setLineDash([]);

    if (hintLevel >= 3) {
      context.globalAlpha = .12;
      context.font = `${rect.width * .58}px "Yu Mincho", "Hiragino Mincho ProN", serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#e9572e";
      context.fillText(content.character, rect.width / 2, rect.height / 2 + rect.height * .04);
      context.globalAlpha = 1;
    }

    if (hintLevel >= 1 && content.referenceStrokes?.[0]) {
      const start = content.referenceStrokes[0].points[0];
      context.fillStyle = "#e9572e";
      context.beginPath();
      context.arc(start.x * rect.width, start.y * rect.height, 7, 0, Math.PI * 2);
      context.fill();
      if (hintLevel >= 2) {
        const end = content.referenceStrokes[0].points.at(-1)!;
        context.strokeStyle = "#e9572e";
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(start.x * rect.width, start.y * rect.height);
        context.lineTo(end.x * rect.width, end.y * rect.height);
        context.stroke();
      }
    }

    const drawStroke = (stroke: Stroke, color = "#2f2b28") => {
      if (stroke.length < 2) return;
      context.strokeStyle = color;
      context.lineWidth = Math.max(7, rect.width * .026);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      context.moveTo(stroke[0].x * rect.width, stroke[0].y * rect.height);
      stroke.slice(1).forEach((point) => context.lineTo(point.x * rect.width, point.y * rect.height));
      context.stroke();
    };
    strokes.forEach((stroke, index) => drawStroke(stroke, feedback?.problemStroke === index + 1 ? "#e9572e" : "#2f2b28"));
    if (activeStroke) drawStroke(activeStroke);
  }, [activeStroke, content, feedback, hintLevel, strokes]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    return normalizePoint({ x: event.clientX - rect.left, y: event.clientY - rect.top }, rect.width, rect.height);
  };

  const clear = () => {
    setStrokes([]);
    setActiveStroke(null);
    setFeedback(null);
  };

  const check = () => {
    const result = validateWriting(content, strokes);
    setFeedback(result);
    onResult(result, hintLevel);
  };

  return (
    <div className="practice-area">
      <div className="practice-toolbar">
        <button className="text-button" onClick={clear}>Clear</button>
        <span>{strokes.length} / {content.strokeCount} strokes</span>
        <button className="text-button" onClick={() => setHintLevel((level) => Math.min(3, level + 1))}>Hint {hintLevel}/3</button>
      </div>
      <canvas
        ref={canvasRef}
        className="practice-canvas"
        aria-label={`Practice writing ${content.character}`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setFeedback(null);
          setActiveStroke([pointFromEvent(event)]);
        }}
        onPointerMove={(event) => {
          if (!activeStroke) return;
          setActiveStroke((stroke) => stroke ? [...stroke, pointFromEvent(event)] : null);
        }}
        onPointerUp={(event) => {
          if (!activeStroke) return;
          setStrokes((existing) => [...existing, [...activeStroke, pointFromEvent(event)]]);
          setActiveStroke(null);
        }}
      />
      <p className={`writing-feedback ${feedback?.correct ? "success" : feedback ? "error" : ""}`} aria-live="polite">
        {feedback?.message ?? (content.referenceStrokes ? "Draw from memory, then check your strokes." : "Practice mode checks stroke count only.")}
      </p>
      <button className="primary-button full-width" onClick={check} disabled={strokes.length === 0}>Check writing</button>
    </div>
  );
}
