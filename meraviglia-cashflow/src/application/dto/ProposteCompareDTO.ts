export interface CashflowMonthDataDTO {
  month: string
  [serviceKey: string]: number | string
}

export interface CompareServiceSeriesDTO {
  key: string
  runtimeServiceId: string
  catalogServiceId: string
  name: string
  color: string
}

export interface CompareCashflowDTO {
  data: CashflowMonthDataDTO[]
  services: CompareServiceSeriesDTO[]
}

