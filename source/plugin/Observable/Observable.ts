type TObserverMethod<TData> = (data: TData) => void;

abstract class Observable<TData = undefined> {
  private readonly observers: TObserverMethod<TData>[] = [];

  public addObserver(observer: TObserverMethod<TData>): void {
    this.observers.push(observer);
  }

  public removeObserver(observer: TObserverMethod<TData>): void {
    this.observers.filter((obs) => obs !== observer);
  }

  protected notifyObservers(data: TData): void {
    const observersSnapshot = [...this.observers];
    observersSnapshot.forEach((obs) => obs(data));
  }
}

export default Observable;
