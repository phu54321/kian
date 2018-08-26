function fragFromHtml (html) {
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node;
    while ((node = tmpDiv.firstChild)) {
        frag.appendChild(node);
    }
    return frag;
}

export function copyHtml () {
    const s = window.getSelection();
    const r = s.getRangeAt(0);
    const content = r.cloneContents();

    const span = document.createElement('span');
    span.appendChild(content);
    const oldHtml = span.innerHTML;
    
    return oldHtml;
}

export function pasteHtml (newHtml) {
    const s = window.getSelection();
    const r = s.getRangeAt(0);
    const frag = fragFromHtml(newHtml);
    r.deleteContents();
    r.insertNode(frag);
    r.collapse();
    return true;
}

export function wrap (front, back) {
    const oldHtml = copyHtml();

    if (oldHtml) {
        const match = oldHtml.match(/^(\s*)([^]*?)(\s*)$/);
        const newHtml = match[1] + front + match[2] + back + match[3];
        pasteHtml(newHtml);
    } else {
        const s = window.getSelection();
        const r = s.getRangeAt(0);

        r.insertNode(fragFromHtml(front));
        r.collapse();
        r.insertNode(fragFromHtml(back));
        r.collapse(true);
    }

    return true;
}
