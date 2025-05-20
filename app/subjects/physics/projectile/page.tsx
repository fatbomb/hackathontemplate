import Simulator from "@/components/interactive/simulator";
import { Bodies } from "matter-js";

export default function ProjectileMotion() {
    return (
        <div className="flex w-screen items-start gap-2 justify-between">
            <div className="w-full">
                <Simulator 
                    bodies={[
                        Bodies.circle(100, 100, 20, { isStatic: true }),
                        Bodies.rectangle(200, 200, 50, 50, { isStatic: true }),
                        Bodies.rectangle(300, 300, 50, 50, { isStatic: true }),
                        Bodies.rectangle(400, 400, 50, 50, { isStatic: true }),
                    ]}
                    width={500}
                    height={500}
                />
            </div>
        </div>
    );
}