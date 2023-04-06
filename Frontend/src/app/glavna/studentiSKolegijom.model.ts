export class StudentiSKolegijom{
  constructor(
    public jmbag: string='',
    public ime: string= '',
    public prezime: string= '',
    public datumupisa: Date= new Date(),
    public svizatog: number[]= []
  ) {
  }
}
