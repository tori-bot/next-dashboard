'use server';//mark all exported functions in this file as server functions
import {z} from 'zod';
import {sql} from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema=z.object({
    id:z.string(),
    customerId:z.string({
        invalid_type_error:'Please select a customer.'//form validation
    }),
    amount:z.coerce.number()//change from string to number
    .gt(0, {message: 'Please enter an amount greater than $0.'}),//greater than function gt()
    status:z.enum(['pending','paid'],{
        invalid_type_error:'Please select an invoice status.'//form validation
    }),
    date:z.string(),
});

const CreateInvoice=FormSchema.omit({id:true,date:true});
const UpdateInvoice=FormSchema.omit({id:true,date:true});

// This is temporary until @types/react-dom is updated
export type State={
    errors?:{
        customerId?:string[];
        amount?:string[];
        status?:string[];
    };
    message?:string | null;
}

export async function createInvoice(prevState:State, formData: FormData){

    //const rawFormData=Object.fromEntries(formData.entries()); //alternative if form has many fields

    //validate form fields with Zod
    const validatedFields =CreateInvoice.safeParse ({//safeParse returns an object containing either 'success' or 'error' field
        customerId:formData.get('customerId'),
        amount:formData.get('amount'),
        status:formData.get('status'),
    });

    if (!validatedFields.success){//if validation not successful return error
        return{
            errors:validatedFields.error.flatten().fieldErrors,
            message:'Missing Fields. Failed to Create Invoice.'
        };
    }

    //prepare data for insertion into db
    const {customerId,amount,status}=validatedFields.data;
    const amountInCents=amount*100;//convert amount in cents
    const date = new Date().toISOString().split('T')[0];//split the iso-format date (e.g., "2024-03-10T12:34:56.789Z") at T and uses the first element of the array (the date)

    try{
    await sql `INSERT INTO invoices (customer_id,amount,status,date) VALUES(${customerId},${amountInCents},${status},${date})`;
    } catch (error){
        return{
            message: 'Database Error: Failed to Create Invoice.'
        };
    }
    //clear cache after db is updated and fetch fresh data from server
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');

}

export async function updateInvoice(id: string, prevState:State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    if (!validatedFields.success){
        return {
            errors:validatedFields.error.flatten().fieldErrors,
            message:'Missing Fields. Failed to Update Invoice.'
        };
    }
   
    const {customerId,amount,status}=validatedFields.data;
    const amountInCents = amount * 100;
   
    try{
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    } catch(error){
        return{
            message: 'Database Error: Failed to Update Invoice.'
        };
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function deleteInvoice(id:string){
    throw new Error('Failed to Delete Invoice');

    try{
    await sql `DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');//re-render table
    return {message: 'Deleted Invoice.'};
    } catch (error){
        return{
            message: 'Database Error: Failed to Delete Invoice.'
        };
    }
  }