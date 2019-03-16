
export interface Pagination {
    getPage(): number;
    setPage(page: number): void;
}

export class PageParam implements Pagination {
    page: number=0;

    getPage(): number {
        return this.page;
    }

    setPage(page: number) {
        this.page = page;
    }
}

export class CurrencyParam extends PageParam {
 
}
