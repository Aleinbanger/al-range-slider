type TObserverMethod<TData> = (data: TData) => void;

abstract class Observable<TData = undefined> {
  private readonly observers: Map<TObserverMethod<TData>, string> = new Map();

  public addObserver(event: string, observer: TObserverMethod<TData>): void {
    this.observers.set(observer, event);
  }

  public removeObserver(observer: TObserverMethod<TData>): void {
    this.observers.delete(observer);
  }

  protected notifyObservers(event: string, data: TData): void {
    const observersSnapshot = new Map(this.observers);
    observersSnapshot.forEach((evn, observer) => {
      if (evn === event) {
        observer(data);
      }
    });
  }
}

export default Observable;
