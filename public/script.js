console.log("i'm from script.js");

(function () {
    var can = document.querySelectorAll("canvas")[0];
    var ctx = can.getContext("2d");
    let mousedown = false;

    ["mousedown", "touchstart"].forEach((ev) => {
        can.addEventListener(ev, (event) => {
            mousedown = true;
            console.log("mousedown");
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#f21d81";
            ctx.moveTo(event.offsetX, event.offsetY);
        });
    });

    ["mousemove", "touchmove"].forEach((ev) => {
        can.addEventListener(ev, (event) => {
            if (mousedown) {
                console.log("mousemove", event);
                ctx.lineTo(event.offsetX, event.offsetY);
                ctx.stroke();
            }
        });
    });

    ["mouseup", "touchend"].forEach((ev) => {
        can.addEventListener(ev, (event) => {
            mousedown = false;
            //const sign = can.toDataURL("image/jpeg", 1);
            const signImg = can.toDataURL("image/png");

            $("#signInput").val(signImg);
            // console.log("CANVAS:", can.toDataURL("image/jpeg", 0.3));
            //console.log("Signature in input:", $("#signInput").val());
        });
    });
})();
