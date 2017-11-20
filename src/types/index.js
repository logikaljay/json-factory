declare type Adapter = {
  list: (Function: string) => Array<string>,
  get: (Function: string, string) => Object,
  set: Function
}
