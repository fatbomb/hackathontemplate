import { Bodies, Body } from "matter-js";

export function scaleBodies(
    bodies: Body[],
    dimensions: { contentWidth: number; contentHeight: number },
    originalDimensions: { width: number; height: number }
): Body[] {
    const scaleX = dimensions.contentWidth / originalDimensions.width;
    const scaleY = dimensions.contentHeight / originalDimensions.height;

    return bodies.map((body) => {
        const scaledVertices = body.vertices.map((vertex) => ({
            x: vertex.x * scaleX,
            y: vertex.y * scaleY,
        }));

        // Preserve all original body properties
        const options = {
            isStatic: body.isStatic,
            friction: body.friction,
            frictionAir: body.frictionAir,
            restitution: body.restitution,
            density: body.density,
            render: body.render,
            label: body.label,
            // Preserve sprite if it exists
            sprite: (body as any).sprite,
            // Preserve any other custom properties
            ...Object.keys(body).reduce((acc, key) => {
                if (!['position', 'vertices', 'parts', 'velocity', 'angularVelocity'].includes(key) && 
                    typeof (body as any)[key] !== 'function') {
                    acc[key] = (body as any)[key];
                }
                return acc;
            }, {} as Record<string, any>)
        };

        const newBody = Bodies.fromVertices(
            body.position.x * scaleX,
            body.position.y * scaleY,
            [scaledVertices],
            options
        )!;

        const velocity = (body as any).customVelocity || body.velocity;
        Body.setVelocity(newBody, {
            x: velocity.x * scaleX,
            y: velocity.y * scaleY,
        });

        newBody.angularVelocity.toFixed(body.angularVelocity);
        Body.setAngle(newBody, body.angle);

        return newBody;
    });
}

export function unscaleBodies(
    bodies: Body[],
    dimensions: { contentWidth: number; contentHeight: number },
    originalDimensions: { width: number; height: number }
): Body[] {
    const scaleX = originalDimensions.width / dimensions.contentWidth;
    const scaleY = originalDimensions.height / dimensions.contentHeight;

    return bodies.map((body) => {
        const scaledVertices = body.vertices.map((vertex) => ({
            x: vertex.x * scaleX,
            y: vertex.y * scaleY,
        }));

        // Preserve all original body properties
        const options = {
            isStatic: body.isStatic,
            friction: body.friction,
            frictionAir: body.frictionAir,
            restitution: body.restitution,
            density: body.density,
            render: body.render,
            label: body.label,
            // Preserve sprite if it exists
            sprite: (body as any).sprite,
            // Preserve any other custom properties
            ...Object.keys(body).reduce((acc, key) => {
                if (!['position', 'vertices', 'parts', 'velocity', 'angularVelocity'].includes(key) && 
                    typeof (body as any)[key] !== 'function') {
                    acc[key] = (body as any)[key];
                }
                return acc;
            }, {} as Record<string, any>)
        };

        const newBody = Bodies.fromVertices(
            body.position.x * scaleX,
            body.position.y * scaleY,
            [scaledVertices],
            options
        )!;

        const velocity = (body as any).customVelocity || body.velocity;
        Body.setVelocity(newBody, {
            x: velocity.x * scaleX,
            y: velocity.y * scaleY,
        });

        newBody.angularVelocity.toFixed(body.angularVelocity);
        Body.setAngle(newBody, body.angle);

        return newBody;
    });
}