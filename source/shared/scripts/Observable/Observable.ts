type TObserverMethod<TData> = (data: TData) => void;

abstract class Observable<TData = undefined> {
  private observers: TObserverMethod<TData>[] = [];

  public addObserver(observer: TObserverMethod<TData>): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  public removeObserver(observer: TObserverMethod<TData>): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  protected notifyObservers(data: TData): void {
    const observersSnapshot = [...this.observers];
    observersSnapshot.forEach((obs) => obs(data));
  }
}

export default Observable;
