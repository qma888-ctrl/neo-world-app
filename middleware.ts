import { nextRequest } from 'next/server'

export function middleware(request: any): any {
  // Custom security policy here
  return nextRequest(request)
}
