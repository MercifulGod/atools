from multiprocessing import Process
import time


def atest(test):
    time.sleep(5)
    print("这是{}".format(test))


def main():
    p1 = Process(target=atest, kwargs={"test": "t1"})
    p2 = Process(target=atest, kwargs={"test": "t2"})
    p1.start()
    p2.start()


if __name__ == "__main__":
    main()
