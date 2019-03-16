export class Page<T> {
    content: T[];

    numberOfElements: number;

    sort: Sort;

    last: boolean;

    totalElements: number;

    pageable: Pageable;

    number: number;

    first: boolean;

    totalPages: number;

    size: number;
}


export class Pageable {
    paged: boolean;

    unpaged: boolean;

    sort: Sort;

    pageSize: number;

    pageNumber: number;

    offset: number;
}

export class Sort {
    unsorted: boolean;

    sorted: boolean;
}
