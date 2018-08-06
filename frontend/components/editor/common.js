export function fragFromHtml (html) {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    while ((node = tmpDiv.firstChild)) {
        frag.appendChild(node);
    }
    return frag;
}

export function wrap (front, back) {
    var s = window.getSelection();
    var r = s.getRangeAt(0);
    var content = r.extractContents();

    var span = document.createElement('span');
    span.appendChild(content);
    const oldHtml = span.innerHTML;

    if (oldHtml) {
        var match = oldHtml.match(/^(\s*)([^]*?)(\s*)$/);
        var newHtml = match[1] + front + match[2] + back + match[3];
        var frag = fragFromHtml(newHtml);

        r.deleteContents();
        r.insertNode(frag);
        r.collapse();
    } else {
        r.insertNode(fragFromHtml(front));
        r.collapse();
        r.insertNode(fragFromHtml(back));
        r.collapse(true);
    }
}
