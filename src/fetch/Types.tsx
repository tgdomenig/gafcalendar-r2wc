
export type FetchResponse<FetchedType> = {
  jsonData: Promise<FetchedType>,
  error: string
}

export type FetchArgs = {
  endpoint: string
}

export type FetchResult<FetchedType> = {
  error?: string, 
  data?: FetchedType
}

export type FetchListResponse<FetchedType> = {
  totalPages: number,
  jsonData: Promise<FetchedType[]>,
  error: string
}

export type FetchListArgs = {
  endpoint: string,
  modifiedDate?: Date,
  perPage?: number,
  order?: string,
  orderby?: string,
  customArgs?: {label: string, value: string}[]
}

export type FetchListResult<FetchedType> = {
  error?: string, 
  events?: FetchedType[]
}

