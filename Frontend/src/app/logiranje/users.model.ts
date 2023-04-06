export class Users{
  constructor(public email: string='',
              public name: string='',
              public password: string='',
              public surname: string='',
              public salt: string='',
              public jmbg: string= '',
              public level: number=0
              ) {
  }
}
