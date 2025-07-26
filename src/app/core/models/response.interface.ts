export interface Response{
  success: boolean;
  message: string;
  statusCode: number;
  token: string;
  error: string;
}

// export interface ResponseWithData<T> extends Response {
//   data: T;
// }

export interface ResponseWithData<T> {
  data:       T;
  success:    boolean;
  message:    string;
  statusCode: number;
  token:      string;
  error:      string;
}

export interface ResponseWithDataCount<T> {
  data:       Data<T>;
  success:    boolean;
  message:    string;
  statusCode: number;
  token:      string;
  error:      string;
}

export interface Data<T> {
  result: T[];
  count:  number;
}
