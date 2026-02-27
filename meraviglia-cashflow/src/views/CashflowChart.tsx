import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface Props {
  mesi: number[]
}

function getColor(value: number, max: number) {
  if (max === 0) return "#e5e5e5"

  const ratio = value / max

  if (ratio > 0.75) return "#7f1d1d" // rosso intenso
  if (ratio > 0.5) return "#b91c1c"
  if (ratio > 0.3) return "#dc2626"
  if (ratio > 0.1) return "#f87171"

  return "#fecaca"
}

export default function CashflowChart({ mesi }: Props) {
  const max = Math.max(...mesi)

  const data = mesi.map((valore, index) => ({
    mese: `M${index + 1}`,
    valore,
  }))

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mese" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="valore">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(entry.valore, max)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}