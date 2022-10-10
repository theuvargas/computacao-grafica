const vertexSize = 5;

function drawIsoTriangle(context, points) {
    const [p1, p2, color] = points;
    drawVertex(context, p1, vertexSize, color);
    drawVertex(context, p2, vertexSize, color);
    context.strokeStyle = color;

    context.beginPath();
    for (let p of isoscelesPoints(points)) {
        context.lineTo(p.x, p.y);
    }
    context.closePath();
    context.stroke();
}

function drawVertex(context, point, radius, color) {
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);
    if (color) {
        context.fillStyle = color;
        context.fill();
    }
}

function drawCircle(context, points) {
    const [base, vertex, color] = points;
    const radius = distance(base, vertex);
    drawVertex(context, base, vertexSize, color);
    drawVertex(context, vertex, vertexSize, color);
    context.beginPath();
    context.arc(base.x, base.y, radius, 0, 2 * Math.PI, false);

    context.strokeStyle = color;
    context.stroke();
}

function sub(p1, p2) {
    let out = {};
    out.x = p1.x - p2.x;
    out.y = p1.y - p2.y;

    return out;
}

function add(p1, p2) {
    let out = {};
    out.x = p1.x + p2.x;
    out.y = p1.y + p2.y;

    return out;
}

function distance(a, b) {
    let x = b.x - a.x;
    let y = b.y - a.y;
    return Math.sqrt(x * x + y * y);
}

function isoscelesPoints(triangle) {
    const [basePoint, oppositeVertex] = triangle;
    const u = sub(basePoint, oppositeVertex);
    const v = { x: -u.y, y: u.x };
    const w = { x: u.y, y: -u.x };
    return [oppositeVertex, add(basePoint, v), add(basePoint, w)];
}

function triangleLineSegments(triangle) {
    const [p1, p2, p3] = isoscelesPoints(triangle);

    return [
        [
            { x: p1.x, y: p1.y },
            { x: p2.x, y: p2.y },
        ],
        [
            { x: p1.x, y: p1.y },
            { x: p3.x, y: p3.y },
        ],
        [
            { x: p2.x, y: p2.y },
            { x: p3.x, y: p3.y },
        ],
    ];
}

function rectangleLineSegments(rectangle) {
    const [p1, p2, p3, p4] = generateRectanglePoints(rectangle);

    return [
        [
            { x: p1.x, y: p1.y },
            { x: p2.x, y: p2.y },
        ],
        [
            { x: p2.x, y: p2.y },
            { x: p3.x, y: p3.y },
        ],
        [
            { x: p3.x, y: p3.y },
            { x: p4.x, y: p4.y },
        ],
        [
            { x: p4.x, y: p4.y },
            { x: p1.x, y: p1.y },
        ],
    ];
}

function determinant(a) {
    let a00 = a[0],
        a01 = a[1],
        a02 = a[2];
    let a10 = a[3],
        a11 = a[4],
        a12 = a[5];
    let a20 = a[6],
        a21 = a[7],
        a22 = a[8];

    return (
        a00 * (a22 * a11 - a12 * a21) +
        a01 * (-a22 * a10 + a12 * a20) +
        a02 * (a21 * a10 - a11 * a20)
    );
}

function orient(a, b, c) {
    return Math.sign(determinant([1, a.x, a.y, 1, b.x, b.y, 1, c.x, c.y]));
}

function figAndCircleIntersect(segs1, circle) {
    for (let i = 0; i < segs1.length; i++) {
        const radius = distance(circle[0], circle[1]);
        if (segAndCircleIntersect(segs1[i], circle[0], radius)) {
            return true;
        }
    }

    return false;
}

function segAndCircleIntersect(seg, C, radius) {
    const [A, B] = seg;

    let dist;
    const v1x = B.x - A.x;
    const v1y = B.y - A.y;
    const v2x = C.x - A.x;
    const v2y = C.y - A.y;

    const u = (v2x * v1x + v2y * v1y) / (v1y * v1y + v1x * v1x);

    if (u >= 0 && u <= 1) {
        dist = (A.x + v1x * u - C.x) ** 2 + (A.y + v1y * u - C.y) ** 2;
    } else {
        dist =
            u < 0
                ? (A.x - C.x) ** 2 + (A.y - C.y) ** 2
                : (B.x - C.x) ** 2 + (B.y - C.y) ** 2;
    }
    return dist < radius * radius;
}

function circlesIntersect(c1, c2) {
    const r1 = distance(c1[0], c1[1]);
    const r2 = distance(c2[0], c2[1]);

    return distance(c1[0], c2[0]) <= r1 + r2;
}

function parallelSegment(seg) {
    const [p1, p2] = seg;

    const normalVector = multiplyVector(
        normalizeVector(perpendicularVector(pointSub(p1, p2))),
        1
    );
    return [pointAdd(p1, normalVector), pointAdd(p2, normalVector)];
}

function figsAreSeparatedBySomeSeg(
    fig1,
    fig2,
    segs1,
    segs2,
    generatePoints1,
    generatePoints2
) {
    const v1 = generatePoints1(fig1);
    const v2 = generatePoints2(fig2);

    const separatedBy1 = segs1.some((seg) => {
        return figsAreSeparatedBySeg(v1, v2, seg);
    });

    const separatedBy2 = segs2.some((seg) => {
        return figsAreSeparatedBySeg(v1, v2, seg);
    });

    return separatedBy1 || separatedBy2;
}

function figsAreSeparatedBySeg(v1, v2, seg) {
    return (
        verticesOnSameSide(v1, seg) &&
        verticesOnSameSide(v2, seg) &&
        !verticesOnSameSide([...v1, ...v2], seg)
    );
}

function verticesOnSameSide(vertices, seg) {
    const target = vertices.length;

    const [a, b] = seg;

    return (
        Math.abs(
            vertices.reduce((prev, curr) => prev + orient(a, b, curr), 0)
        ) === target
    );
}

function outerFigSegs(fig, generateSegs, generatePoints) {
    const segments = generateSegs(fig);
    const vertices = generatePoints(fig);

    const outerSegs = [];

    for (seg of segments) {
        let outerSeg = parallelSegment(seg);
        if (verticesOnSameSide(vertices, outerSeg)) {
            outerSegs.push(outerSeg);
        } else {
            const [a, b] = seg;
            outerSegs.push(parallelSegment([b, a]));
        }
    }

    return outerSegs;
}

function detectRectCollision(rect, others, triangles, circles) {
    const rectSegs = outerFigSegs(
        rect,
        rectangleLineSegments,
        generateRectanglePoints
    );

    for (rect2 of others) {
        const rect2Segs = outerFigSegs(
            rect2,
            rectangleLineSegments,
            generateRectanglePoints
        );
        if (
            !figsAreSeparatedBySomeSeg(
                rect,
                rect2,
                rectSegs,
                rect2Segs,
                generateRectanglePoints,
                generateRectanglePoints
            )
        ) {
            rect[3] = 'red';
            rect2[3] = 'red';
        }
    }

    for (tri of triangles) {
        const triSegs = outerFigSegs(
            tri,
            triangleLineSegments,
            isoscelesPoints
        );
        if (
            !figsAreSeparatedBySomeSeg(
                rect,
                tri,
                rectSegs,
                triSegs,
                generateRectanglePoints,
                isoscelesPoints
            )
        ) {
            rect[3] = 'red';
            tri[2] = 'red';
        }
    }
    const rectSegsNormal = rectangleLineSegments(rect);
    const rectPoints = generateRectanglePoints(rect);
    for (circ of circles) {
        if (
            figAndCircleIntersect(rectSegsNormal, circ) ||
            rectSegs.every((seg) => {
                return verticesOnSameSide(
                    [...rectPoints, circ[0], circ[1]],
                    seg
                );
            })
        ) {
            rect[3] = 'red';
            circ[2] = 'red';
        }
    }
}

function detectTriCollision(tri, others, rectangles, circles) {
    const triSegs = outerFigSegs(tri, triangleLineSegments, isoscelesPoints);

    for (tri2 of others) {
        const triSegs2 = outerFigSegs(
            tri2,
            triangleLineSegments,
            isoscelesPoints
        );
        if (
            !figsAreSeparatedBySomeSeg(
                tri,
                tri2,
                triSegs,
                triSegs2,
                isoscelesPoints,
                isoscelesPoints
            )
        ) {
            tri[2] = 'red';
            tri2[2] = 'red';
        }
    }

    for (rect of rectangles) {
        const rectSegs = outerFigSegs(
            rect,
            rectangleLineSegments,
            generateRectanglePoints
        );
        if (
            !figsAreSeparatedBySomeSeg(
                tri,
                rect,
                triSegs,
                rectSegs,
                isoscelesPoints,
                generateRectanglePoints
            )
        ) {
            tri[2] = 'red';
            rect[3] = 'red';
        }
    }

    const triSegsNormal = triangleLineSegments(tri);
    const triPoints = isoscelesPoints(tri);
    for (circ of circles) {
        if (
            figAndCircleIntersect(triSegsNormal, circ) ||
            triSegs.every((seg) => {
                return verticesOnSameSide(
                    [...triPoints, circ[0], circ[1]],
                    seg
                );
            })
        ) {
            tri[2] = 'red';
            circ[2] = 'red';
        }
    }
}

function detectCircCollision(circ, others) {
    for (circ2 of others) {
        if (circlesIntersect(circ, circ2)) {
            circ[2] = 'red';
            circ2[2] = 'red';
        }
    }
}

function detectCollision(rectangles, triangles, circles, context) {
    detectRectCollision(
        rectangles[0],
        [rectangles[1], rectangles[2]],
        triangles,
        circles
    );
    detectRectCollision(rectangles[1], [rectangles[2]], triangles, circles);
    detectRectCollision(rectangles[2], [], triangles, circles);

    detectTriCollision(
        triangles[0],
        [triangles[1], triangles[2]],
        rectangles,
        circles
    );

    detectTriCollision(triangles[1], [triangles[2]], [], circles);
    detectTriCollision(triangles[2], [], [], circles);

    detectCircCollision(circles[0], [circles[1], circles[2]]);
    detectCircCollision(circles[1], [circles[2]]);
}

function resetColors(triangles, circles, rectangles) {
    for (let i = 0; i < 3; i++) {
        triangles[i][2] = 'black';
        circles[i][2] = 'black';
        rectangles[i][3] = 'black';
    }
}

function drawFigures(context, figures) {
    const [triangles, circles, rectangles] = figures;

    resetColors(triangles, circles, rectangles);
    detectCollision(rectangles, triangles, circles, context);

    context.clearRect(0, 0, 1000, 1000);
    triangles.forEach((triangle) => {
        drawIsoTriangle(context, triangle);
    });
    circles.forEach((circle) => {
        drawCircle(context, circle);
    });
    rectangles.forEach((rectangle) => {
        drawRectangle(context, rectangle);
    });
}

function main() {
    const canvasElement = document.querySelector('#theCanvas');
    const context = canvasElement.getContext('2d');

    let triangles = [
        [{ x: 150, y: 300 }, { x: 300, y: 200 }, 'black'],
        [{ x: 480, y: 300 }, { x: 540, y: 150 }, 'black'],
        [{ x: 400, y: 350 }, { x: 420, y: 300 }, 'black'],
    ];

    let circles = [
        [{ x: 150, y: 600 }, { x: 100, y: 600 }, 'black'],
        [{ x: 320, y: 550 }, { x: 300, y: 600 }, 'black'],
        [{ x: 490, y: 600 }, { x: 460, y: 550 }, 'black'],
    ];

    let rectangles = [
        [{ x: 100, y: 800 }, { x: 50, y: 800 }, { x: 100, y: 750 }, 'black'],
        [{ x: 250, y: 800 }, { x: 200, y: 800 }, { x: 250, y: 750 }, 'black'],
        [{ x: 400, y: 800 }, { x: 350, y: 800 }, { x: 400, y: 750 }, 'black'],
    ];

    circles.forEach((circle) => {
        drawCircle(context, circle);
    });

    triangles.forEach((triangle) => {
        drawIsoTriangle(context, triangle);
    });

    rectangles.forEach((r) => {
        drawRectangle(context, r);
    });

    window.onmouseup = () => {
        window.onmousemove = null;
    };

    const triangleDragBase = (e, triangle) => {
        let mouse = { x: e.offsetX, y: e.offsetY };
        let [base, vtx, color] = triangle;

        const diffX = base.x - vtx.x;
        const diffY = base.y - vtx.y;

        const newVtx = { x: mouse.x - diffX, y: mouse.y - diffY };

        return [mouse, newVtx, color];
    };

    const triangleDragVtx = (e, triangle) => {
        const mouse = { x: e.offsetX, y: e.offsetY };
        const base = triangle[0];
        const color = triangle[2];

        return [base, mouse, color];
    };

    const circleDragBase = (e, circle) => {
        let [base, vtx, color] = circle;
        const vtxDiffX = vtx.x - base.x;
        const vtxDiffY = vtx.y - base.y;
        let mouse = { x: e.offsetX, y: e.offsetY };
        let newVtx = { x: mouse.x + vtxDiffX, y: mouse.y + vtxDiffY };

        return [mouse, newVtx, color];
    };

    const circleDragVtx = (e, circle) => {
        const mouse = { x: e.offsetX, y: e.offsetY };
        const base = circle[0];
        const color = circle[2];

        return [base, mouse, color];
    };

    const rectangleDragVtx2 = (e, rectangle) => {
        const mouse = { x: e.offsetX, y: e.offsetY };
        let [base, vtx, perpVtx, color] = rectangle;

        const len = distance(base, perpVtx);
        const newPerpVtx = pointAdd(
            multiplyVector(
                normalizeVector(perpendicularVector(pointSub(mouse, base))),
                len
            ),
            base
        );

        return [base, mouse, newPerpVtx, color];
    };
    const rectangleDragVtx3 = (e, rectangle) => {
        const mouse = { x: e.offsetX, y: e.offsetY };
        let [base, vtx, perpVtx, color] = rectangle;

        const len = distance(base, vtx);
        const newPerpVtx = pointAdd(
            multiplyVector(
                normalizeVector(perpendicularVector(pointSub(mouse, base))),
                len
            ),
            base
        );

        return [base, newPerpVtx, mouse, color];
    };

    const rectangleDragBase2 = (e, rectangle) => {
        const mouse = { x: e.offsetX, y: e.offsetY };
        const [base, vtx, vtx2, color] = rectangle;

        const newVtx = pointSub(mouse, pointSub(base, vtx));

        const newPerpVtx = pointSub(mouse, pointSub(base, vtx2));

        return [mouse, newVtx, newPerpVtx, color];
    };

    window.onmousedown = (e) => {
        const maxDist = 10;
        const mouse = { x: e.offsetX, y: e.offsetY };
        window.onmousemove = null;

        for (let i of [0, 1]) {
            circles.forEach((circle, j) => {
                let p = circle[i];
                let d = distance(mouse, p);

                if (d <= maxDist) {
                    window.onmousemove =
                        i === 0
                            ? (e) => {
                                  circles[j] = circleDragBase(e, circle);
                                  drawFigures(context, [
                                      triangles,
                                      circles,
                                      rectangles,
                                  ]);
                              }
                            : (e) => {
                                  circles[j] = circleDragVtx(e, circle);
                                  drawFigures(context, [
                                      triangles,
                                      circles,
                                      rectangles,
                                  ]);
                              };
                }
            });

            triangles.forEach((triangle, j) => {
                const p = triangle[i];
                const d = distance(mouse, p);

                if (d <= maxDist) {
                    window.onmousemove =
                        i === 0
                            ? (e) => {
                                  triangles[j] = triangleDragBase(e, triangle);
                                  drawFigures(context, [
                                      triangles,
                                      circles,
                                      rectangles,
                                  ]);
                              }
                            : (e) => {
                                  triangles[j] = triangleDragVtx(e, triangle);
                                  drawFigures(context, [
                                      triangles,
                                      circles,
                                      rectangles,
                                  ]);
                              };
                }
            });
        }
        rectangles.forEach((rect, j) => {
            const [base, vtx, vtx2, color] = rect;
            let p1 = vtx;
            let p2 = pointReflection(p1, base);

            const len = distance(vtx2, base);
            let p3 = pointAdd(
                multiplyVector(
                    normalizeVector(perpendicularVector(pointSub(vtx, base))),
                    len
                ),
                base
            );
            let p4 = pointReflection(p3, base);

            let d0 = distance(mouse, base);
            let d1 = distance(mouse, p1);
            let d2 = distance(mouse, p2);
            let d3 = distance(mouse, p3);
            let d4 = distance(mouse, p4);

            if (d0 <= maxDist) {
                window.onmousemove = (e) => {
                    rectangles[j] = rectangleDragBase2(e, rect);
                    drawFigures(context, [triangles, circles, rectangles]);
                };
            }

            if (d1 <= maxDist) {
                window.onmousemove = (e) => {
                    rectangles[j] = rectangleDragVtx2(e, rect, 1);
                    drawFigures(context, [triangles, circles, rectangles]);
                };
            }
            if (d2 <= maxDist) {
                window.onmousemove = (e) => {
                    rectangles[j] = rectangleDragVtx2(e, rect, 2);
                    drawFigures(context, [triangles, circles, rectangles]);
                };
            }
            if (d3 <= maxDist) {
                window.onmousemove = (e) => {
                    rectangles[j] = rectangleDragVtx3(e, rect, 3);
                    drawFigures(context, [triangles, circles, rectangles]);
                };
            }
            if (d4 <= maxDist) {
                window.onmousemove = (e) => {
                    rectangles[j] = rectangleDragVtx3(e, rect, 4);
                    drawFigures(context, [triangles, circles, rectangles]);
                };
            }
        });
    };
}

function pointReflection(p, reference) {
    return { x: 2 * reference.x - p.x, y: 2 * reference.y - p.y };
}

function normalizeVector(v) {
    const size = Math.sqrt(v.x * v.x + v.y * v.y);
    return { x: v.x / size, y: v.y / size };
}

function perpendicularVector(v) {
    return { x: v.y, y: -v.x };
}

function decomposedDistance(p1, p2) {
    const xDist = p1.x - p2.x;
    const yDist = p1.y - p2.y;

    return [xDist, yDist];
}

function pointSub(p1, p2) {
    const x = p1.x - p2.x;
    const y = p1.y - p2.y;

    return { x, y };
}

function pointAdd(p1, p2) {
    const x = p1.x + p2.x;
    const y = p1.y + p2.y;

    return { x, y };
}

function multiplyVector(v, n) {
    return { x: v.x * n, y: v.y * n };
}

function drawRectangle(context, rectangle) {
    const [base, vtx, perpVtx, color] = rectangle;
    drawVertex(context, base, vertexSize, color);
    drawVertex(context, vtx, vertexSize, color);
    drawVertex(context, pointReflection(vtx, base), vertexSize, color);

    const len = distance(perpVtx, base);
    const p2 = pointAdd(
        multiplyVector(
            normalizeVector(perpendicularVector(pointSub(vtx, base))),
            len
        ),
        base
    );

    const p3 = pointReflection(p2, base);
    drawVertex(context, p2, vertexSize, color);
    drawVertex(context, p3, vertexSize, color);

    context.strokeStyle = color;
    context.beginPath();
    for (let p of generateRectanglePoints(rectangle)) {
        context.lineTo(p.x, p.y);
    }

    context.closePath();
    context.stroke();
}

function generateRectanglePoints(rectangle) {
    const [base, vtx, perpVtx] = rectangle;

    const e1 = pointAdd(
        base,
        pointAdd(pointSub(vtx, base), pointSub(perpVtx, base))
    );
    const e2 = pointReflection(e1, perpVtx);
    const e3 = pointReflection(e1, base);
    const e4 = pointReflection(e1, vtx);

    return [e1, e2, e3, e4];
}
