import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts"

interface ServiceSeries {
  key: string
  runtimeServiceId: string
  catalogServiceId: string
  name: string
  color: string
}

interface CashflowMonthData {
  month: string
  [serviceKey: string]: number | string
}

interface Props {
  data: CashflowMonthData[]
  services: ServiceSeries[]
  monthlyTotals: number[]
  totalYearOne: number
  total24Months: number
}

const formatCurrency = (value: number): string => (
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)
)

export default function CashflowChart({ data, services, monthlyTotals, totalYearOne, total24Months }: Props) {

  const peakValue = monthlyTotals.reduce((peak, value) => Math.max(peak, value), 0)
  const peakMonthIndex = monthlyTotals.findIndex((value) => value === peakValue)

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 12, fontWeight: 700 }}>
        <span>Totale Anno 1: {formatCurrency(totalYearOne)}</span>
        <span>Totale 24 Mesi: {formatCurrency(total24Months)}</span>
        {peakMonthIndex >= 0 ? <span>Peak: M{peakMonthIndex + 1} ({formatCurrency(peakValue)})</span> : null}
      </div>

      <div style={{ width: "100%", minHeight: 340 }}>
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              {services.map((service) => (
                <Bar
                  key={service.key}
                  dataKey={service.key}
                  stackId="cashflow"
                  name={service.name}
                  fill={service.color}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`${service.key}-${index}`}
                      stroke={index === peakMonthIndex ? "#111827" : undefined}
                      strokeWidth={index === peakMonthIndex ? 1.5 : 0}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 12, fontWeight: 700 }}>
        Cumulato finale: {formatCurrency(total24Months)}
      </div>
    </div>
  )
}
