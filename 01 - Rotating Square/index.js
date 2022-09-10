function drawCircle(context, x, y, radius, fill) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    if (fill) {
        context.fillStyle = fill;
        context.fill();
    }
}

function drawFigure(context, points) {
    drawSquare(context, points);
    drawVertices(context, points);
}

function drawVertices(context, vertices) {
    const colors = ['red', 'blue', 'white', 'green'];
    vertices.forEach((point, i) => {
        const { x, y } = point;

        drawCircle(context, x, y, 5, colors[i]);
    });
}

function drawSquare(context, points) {
    context.beginPath();

    points.forEach((point) => {
        const { x, y } = point;
        context.lineTo(x, y);
    });

    context.fillStyle = '#e88823';
    context.fill();
}

function translateToOrigin(points, vertex) {
    xOffset = points[vertex].x;
    yOffset = points[vertex].y;
    return points.map((point) => {
        return new DOMPoint(point.x - xOffset, point.y - yOffset);
    });
}

function translateBack(points, xOffset, yOffset) {
    return points.map((point) => {
        return new DOMPoint(point.x + xOffset, point.y + yOffset);
    });
}

function setAnimation(context, points, width, height) {
    let vertex = 0;
    let angleChange = 2;

    document.addEventListener('keypress', (e) => {
        const key = e.key;

        if (key === 'r') {
            vertex = 0;
        } else if (key === 'b') {
            vertex = 1;
        } else if (key === 'w') {
            vertex = 2;
        } else if (key === 'g') {
            vertex = 3;
        } else if (key === 'a') {
            angleChange = -angleChange;
        }
    });

    const run = () => {
        // saves the figures position based on the axis vertex
        let lastOffsets = [points[vertex].x, points[vertex].y];
        // gets the figure to the origin for the rotation to work
        points = translateToOrigin(points, vertex);

        const radians = angleChange * (Math.PI / 180);

        // rotation matrix
        const matrix = new DOMMatrix([
            Math.cos(radians),
            Math.sin(radians),
            -Math.sin(radians),
            Math.cos(radians),
            0,
            0,
        ]);

        // applies the rotation to each point
        points = points.map((point) => {
            return point.matrixTransform(matrix);
        });

        // gets the figure back to where it was, but rotated
        points = translateBack(points, ...lastOffsets);

        // deletes the previous figure and immediately draws a new one
        context.clearRect(0, 0, width, height);
        drawFigure(context, points);

        requestAnimationFrame(run);
    };
    return run;
}

function mainEntrance() {
    const canvasElement = document.querySelector('#theCanvas');
    const context = canvasElement.getContext('2d');

    const width = canvasElement.width;
    const height = canvasElement.height;

    const squareSize = 80;

    const x = (width - squareSize) / 2;
    const y = (height - squareSize) / 2;

    let points = [
        new DOMPoint(x, y),
        new DOMPoint(x + squareSize, y),
        new DOMPoint(x + squareSize, y + squareSize),
        new DOMPoint(x, y + squareSize),
    ];

    const runAnimation = setAnimation(context, points, width, height);

    runAnimation();
}
