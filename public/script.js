console.log("i'm from script.js");

(function () {
    var can = document.querySelectorAll("canvas")[0];
    var ctx = can.getContext("2d");
    let mousedown = false;

    can.addEventListener("mousedown", (event) => {
        mousedown = true;
        console.log("mousedown");
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#f21d81";
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
        //const sign = can.toDataURL("image/jpeg", 1);
        const signImg = can.toDataURL("image/png");

        $("#signInput").val(signImg);
        // console.log("CANVAS:", can.toDataURL("image/jpeg", 0.3));
        //console.log("Signature in input:", $("#signInput").val());
    });
})();
