const emjList = [
    "😀",
    "😁 ",
    "😂",
    "🤣",
    "😃",
    "😄",
    "😅",
    "😆",
    "😉",
    "😊",
    "😋",
    "😎",
    "😍",
    "🙂",
    "🤗",
    "🤩",
    "😏",
    "😻",
    "😼",
];

module.exports.getEmoji = () => {
    const i = Math.floor(Math.random() * emjList.length);
    return emjList[i];
};
