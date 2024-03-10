'use server';//mark all exported functions in this file as server functions
import {z} from 'zod';
import {sql} from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema=z.object({
    id:z.string(),
    customerId:z.string(),
    amount:z.coerce.number(),//change from string to number
    status:z.enum(['pending','paid']),
    date:z.string(),
});

const CreateInvoice=FormSchema.omit({id:true,date:true});
const UpdateInvoice=FormSchema.omit({id:true,date:true});

export async function createInvoice(formData: FormData){

    //const rawFormData=Object.fromEntries(formData.entries()); //alternative if form has many fields

    const {customerId,amount,status} =CreateInvoice.parse ({
        customerId:formData.get('customerId'),
        amount:formData.get('amount'),
        status:formData.get('status'),
    });
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

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
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