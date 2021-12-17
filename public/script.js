console.log("i'm from script.js");

(function () {
    var can = document.querySelectorAll("canvas")[0];
    var ctx = can.getContext("2d");
    let mousedown = false;

    ["mousedown", "touchstart"].forEach((type) => {
        can.addEventListener(type, (event) => {
            mousedown = true;
            console.log("mousedown");
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#f21d81";
            const point = getXY(type, event, ["mousedown", "touchstart"]);
            ctx.moveTo(point.x, point.y);
            event.preventDefault();
        });
    });

    ["mousemove", "touchmove"].forEach((type) => {
        can.addEventListener(type, (event) => {
            if (mousedown) {
                const point = getXY(type, event, ["mousemove", "touchmove"]);
                ctx.lineTo(point.x, point.y);
                ctx.stroke();
                event.preventDefault();
            }
        });
    });

    function getXY(type, event, types) {
        let x = 0,
            y = 0;
        if (type == types[0]) {
            x = event.offsetX;
            y = event.offsetY;
        } else if (type == types[1]) {
            const touches = event.changedTouches;
            x = touches[0].pageX;
            y = touches[0].pageY - can.offsetTop;
        }
        return { x, y };
    }

    ["mouseup", "touchend"].forEach((type) => {
        can.addEventListener(type, (event) => {
            mousedown = false;
            const signImg = can.toDataURL("image/png");

            $("#signInput").val(signImg);
            //event.preventDefault();
        });
    });
})();
