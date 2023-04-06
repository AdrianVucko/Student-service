export class NastavniciSkolegijom{
  constructor(
    public jmbg:string='',
    public email: string='',
    public ime: string='',
    public prezime: string='',
    public lozinka: string='',
    public salt: string='',
    public level: number=0,
    public svizatog: number[]=[]
  ) {
  }
}
