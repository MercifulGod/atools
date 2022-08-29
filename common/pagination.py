from math import ceil
from tortoise.queryset import QuerySet, MODEL
from typing import Optional, List


class Paginator:

    def __init__(self, object_list: Optional[QuerySet[MODEL]], page_size=25):
        self.object_list = object_list
        self.count = 0  # 数据总长度
        self.page = 1  # 数据总长度
        self.show_page = 10  # 要展示的页数
        self.page_size = 25
        self.num_pages = 0  # 数据总页数

    def __iter__(self):
        for item in self.object_list:
            yield item

    async def get_page(self, number):
        """Return a Page object for the given 1-based page number."""
        self.count = await self.object_list.count()
        self.num_pages = ceil(self.count / self.page_size)
        self.page = number
        offset = (number - 1) * self.page_size
        self.object_list = await self.object_list.offset(offset).limit(self.page_size).all()
        return self

    @property
    def next_page(self):
        return self.page + 1 if self.page < self.num_pages else self.num_pages

    @property
    def previous_page(self):
        return self.page - 1 if self.page > 2 else None

    @property
    def page_range(self):
        """
        Return a 1-based range of pages for iterating through within
        a template for loop.
        """
        return range(1, self.num_pages + 1)

    # 覆写page方法
    def get_page_range(self):
        number = self.page
        # show_page: 要展示的页码数
        if self.num_pages <= self.show_page:
            yield from self.page_range
            return
        middle = (self.show_page // 2)
        if number <= middle:  # 开头
            yield from range(1, self.show_page + 1)
        elif number > self.num_pages - middle - 1:
            yield from range(self.num_pages - self.show_page + 1, self.num_pages + 1)
        else:
            yield from range(number - middle, number + middle + 1)
