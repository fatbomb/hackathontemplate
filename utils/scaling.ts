import { Bodies, Body } from "matter-js";

export function scaleBodies(bodies: Body[], dimensions: { contentWidth: number; contentHeight: number }, originalDimensions: { width: number; height: number }): Body[] {
    const scaleX = dimensions.contentWidth / originalDimensions.width;
    const scaleY = dimensions.contentHeight / originalDimensions.height;

    return bodies.map(body => {
        const scaledVertices = body.vertices.map(vertex => ({
            x: vertex.x * scaleX,
            y: vertex.y * scaleY,
        }));

        const newBody = Bodies.fromVertices(
            body.position.x * scaleX,
            body.position.y * scaleY,
            [scaledVertices],
            {
                isStatic: body.isStatic,
            }
        );

        return newBody!;
    });
}
