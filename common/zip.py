import zipfile
import io


class InMemoryZip(object):
    def __init__(self):
        self.in_memory_zip = io.BytesIO()

    def append(self, filename_in_zip, file_contents):
        zf = zipfile.ZipFile(self.in_memory_zip, "a", zipfile.ZIP_STORED, False)
        zf.writestr(filename_in_zip, file_contents)
        for zfile in zf.filelist:
            zfile.create_system = 0
        return self

    def read(self):
        self.in_memory_zip.seek(0)
        return self.in_memory_zip.read()

    def write(self, filename):
        f = open(filename, "wb")
        f.write(self.read())
        f.close()


if __name__ == "__main__":
    imz = InMemoryZip()
    f1 = open('/home/yangbing/jpg/1.jpg', 'rb').read()
    imz.append("1.jpg", f1)
    f2 = open('/home/yangbing/jpg/2.jpg', 'rb').read()
    imz.append("2.jpg", f2)
    imz.write("test.zip")
