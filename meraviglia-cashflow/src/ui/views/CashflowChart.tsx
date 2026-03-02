import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"

interface ServiceSeries {
  key: string
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
}

export default function CashflowChart({ data, services }: Props) {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
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
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
