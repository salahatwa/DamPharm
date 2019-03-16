import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { Page } from '../../core/classes/page';

export interface CrudOperations<T, ID> {
	
	findPage(query?:any): Observable<Page<T>>;

	save(t: T): Observable<T>;
	
}
