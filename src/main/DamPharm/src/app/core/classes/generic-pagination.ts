import { Pagination } from "./ParamInterfaces";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "../../shared/services/utils.service";
import { CrudService } from "../../shared/services/crud.service";
import { PageLoading, HttpMethod } from "./page-loader/page-loading";
import { EventEmitter, Output } from "@angular/core";


/**
 * This Generic Pagination Component 
 * 1- extends GenericPagination<T>
 * 2- Inject  Your service then call super and Pass Your Injected Service
 * 3- set your params and it must extends PageParam  and write method and pass the following code
 * 4- const post = new PostParam(); // Your Custom Param That extends From PageParam
 * 5- post.page = this.page;
 * 6- this.setPageParam(post);
 * 7- this.loadPage();
 * 8- call your method in ngOnInit() method
 * 9- in your html component use results to iterate over each element That You Passed GenericPagination<T>
 * 10- in *ngFor="let post of results  | paginate: { id: 'server', itemsPerPage: 5, currentPage: page , totalItems: totalElements  } ; let i = index"
 * 11- <pagination-controls [responsive]="responsive" (pageChange)="onPageChange($event)" id="server"></pagination-controls> 
 */
export class EventData<T>{
    results: T[]; // return result of arrays
    page: number = 0;
    totalElements: number;
    paginationParam: Pagination;
}

export class GenericPagination<T> extends PageLoading{

   

    results: T[]; // return result of arrays

    page: number = 0;
    totalElements: number;
    paginationParam: Pagination;

    /**
     * Generic Update Event 
     * This Event Used To Update results List
     */
    @Output('update')
    update: EventEmitter<EventData<T>> = new EventEmitter<EventData<T>>();
    eventData:EventData<T>=new EventData<T>();
    isUpdateEvent:boolean=false;

    /**
     * Enum To define if reuqest Post OR GET
     * IF It Get SEND DATA Through paramteres Using Get Mehtod
     * IF It Post Send Data through Body Uing Post mehtod
     * difference between Post & Get cause header request in get method 
     * can't carry more than 2000 character
     * Post can carry more data
     */
      method: HttpMethod =HttpMethod.GET;

    constructor(private service: CrudService<T, any>) {
     super(true);
    }

    /**
     * Load Page content
     */
    loadPage() {
        this.standby();
        this.service.findPage(this.paginationParam,this.method).subscribe(
            data => {
                this.totalElements = data.totalElements;
                this.results = data.content;

                //Check If Update Event fire or not
                if(this.isUpdateEvent)
                {
                 this.eventData.totalElements=data.totalElements;
                 this.eventData.results=data.content;
                 this.eventData.paginationParam=this.paginationParam;
                 this.eventData.page=this.page;
                 this.update.emit(this.eventData);
                }
                this.ready();
            }
        );
    }


    /**
    * Action Implementation when click on Specific Page Number
    * @param page 
    */
    onPageChange(page: number) {

        this.page = page;

        this.paginationParam.setPage(page - 1);

        this.loadPage();

    }

    /**
     * 
     * @param paginationParam Page Paramters
     */
    setPageParam(paginationParam: Pagination) {
        this.paginationParam = paginationParam;
    }

    setMethodType(type:HttpMethod)
    {
        this.method=type;
    }


}
