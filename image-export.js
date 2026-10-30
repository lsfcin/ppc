// PNG and SVG download of the page, without toolbar, add buttons and the constraint sidebar
const IMAGE_SKIP = '.toolbar, .tool-btn, .add-btn, .constraint-bar, .import-file, template'

// Alpine attributes (@click, :class, x-…) are not valid XML names and break the SVG; render a clean clone instead
function cleanClone(node) {
  const clone   = node.cloneNode(true)
  const sources = node.querySelectorAll('input')
  clone.querySelectorAll('input').forEach((input, i) => input.setAttribute('value', sources[i].value))
  clone.querySelectorAll(IMAGE_SKIP).forEach(el => el.remove())
  ;[clone, ...clone.querySelectorAll('*')].forEach(el =>
    [...el.attributes].filter(a => /^[@:]|^x-/.test(a.name)).forEach(a => el.removeAttribute(a.name)))
  Object.assign(clone.style, { position: 'fixed', left: '-100000px', top: '0', width: `${node.offsetWidth}px` })
  return clone
}

function ppcImageExport() {
  return {
    async exportImage(format) {
      const clone  = document.body.appendChild(cleanClone(document.querySelector('.wrap')))
      const render = format === 'svg' ? htmlToImage.toSvg : htmlToImage.toPng
      try {
        const href = await render(clone, { backgroundColor: '#ffffff', pixelRatio: 2, style: { position: 'static', left: '0' } })
        Object.assign(document.createElement('a'), {
          href, download: `grade-${new Date().toISOString().slice(0, 10)}.${format}`,
        }).click()
      } finally {
        clone.remove()
      }
    },
  }
}
