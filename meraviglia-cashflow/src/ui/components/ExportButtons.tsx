import { toPng, toSvg } from "html-to-image"

interface Props {
  elementId: string
}

export default function ExportButtons({ elementId }: Props) {

  const exportPNG = async () => {
    const element = document.getElementById(elementId)
    if (!element) return

    const dataUrl = await toPng(element)
    const link = document.createElement("a")
    link.download = "meraviglia-cashflow.png"
    link.href = dataUrl
    link.click()
  }

  const exportSVG = async () => {
    const element = document.getElementById(elementId)
    if (!element) return

    const dataUrl = await toSvg(element)
    const link = document.createElement("a")
    link.download = "meraviglia-cashflow.svg"
    link.href = dataUrl
    link.click()
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <button onClick={exportPNG} style={{ marginRight: 10 }}>
        Export PNG
      </button>

      <button onClick={exportSVG}>
        Export SVG
      </button>
    </div>
  )
}