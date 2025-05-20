"use client";
import { scaleBodies } from "@/utils/scaling";
import { Body, Composite, Engine, Render, Runner, World } from "matter-js";
import { useEffect, useRef, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";

type SimulatorProps = {
    bodies: Body[];
    width: number;
    height: number;
};

export default function Simulator({
    bodies,
    width,
    height,
}: SimulatorProps) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ contentWidth: width, contentHeight: height });

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width: containerWidth, height: containerHeight } = entry.contentRect;

                const targetAspect = width / height;
                const containerAspect = containerWidth / containerHeight;

                let contentWidth: number;
                let contentHeight: number;

                if (containerAspect > targetAspect) {
                    // Container is wider — limit by height
                    contentHeight = containerHeight;
                    contentWidth = Math.round(containerHeight * targetAspect);
                } else {
                    // Container is taller — limit by width
                    contentWidth = containerWidth;
                    contentHeight = Math.round(containerWidth / targetAspect);
                }

                setDimensions({ contentWidth, contentHeight });
            }
        });


        observer.observe(document.querySelector("#scene")!);

        return () => observer.disconnect(); 
    }, []);

    useEffect(() => {
        const { contentWidth, contentHeight } = dimensions;
        const scene = sceneRef.current;
        if (!scene || contentWidth === 0 || contentHeight === 0) return;

        const engine = Engine.create();
        const render = Render.create({
            element: scene,
            engine,
            options: {
                width: contentWidth,
                height: contentHeight,
                wireframes: false,
                background: "#f0f0f0",
            },
        });

        // Clone + scale bodies from original
        const scaledBodies = scaleBodies(bodies, dimensions, { width, height });
        Composite.add(engine.world, scaledBodies);

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        return () => {
            Render.stop(render);
            Runner.stop(runner);
            World.clear(engine.world, false);
            Engine.clear(engine);
            if (render.canvas.parentNode) {
                render.canvas.parentNode.removeChild(render.canvas);
            }
        };
    }, [dimensions, bodies, width, height]);


    return (
        <div
            id="scene"
            ref={sceneRef}
            style={{ width: "100%", height: "100%" }}
            className="w-full h-full"
        ></div>
    );

}