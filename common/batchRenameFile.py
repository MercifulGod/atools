from os import listdir
import os


def rename_file(dirPath="/Users/rookie/projects/itnote/code_server/ffsm/templates"):
    try:
        index_file = listdir(dirPath)
        for file in index_file:
            if os.path.isfile(os.path.join(dirPath, file)) == True:
                if not file.endswith(".tpl"):
                    continue
                newFilename = file.replace(".tpl", ".html")
                src_file = os.path.join(dirPath, file)
                new_file = os.path.join(dirPath, newFilename)
                os.rename(src_file, new_file)
            else:
                rename_file(os.path.join(dirPath, file))

    except Exception as e:
        # 打印异常信息
        print(e)


if __name__ == '__main__':
    rename_file()
