console.log("i'm from script.js");

(function () {
    var can = document.querySelectorAll("canvas")[0];
    var ctx = can.getContext("2d");
    console.log(can);
    let mousedown = false;

    can.addEventListener("mousedown", (event) => {
        mousedown = true;
        console.log("mousedown");
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "blue";
        ctx.moveTo(event.offsetX, event.offsetY);
    });

    can.addEventListener("mousemove", (event) => {
        if (mousedown) {
            console.log("mousemove", event);
            ctx.lineTo(event.offsetX, event.offsetY);
            ctx.stroke();
        }
    });

    can.addEventListener("mouseup", (event) => {
        mousedown = false;
    });
})();
