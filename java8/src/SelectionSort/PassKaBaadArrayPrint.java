package SelectionSort;

import java.util.Arrays;

public class PassKaBaadArrayPrint {
public static void main(String[] args) {
	int arr[]={29, 10, 14, 37, 13};
	for(int i=0;i<arr.length-1;i++) {
		int minIndex=i;
		for(int j=i+1;j<arr.length;j++) {
			
			if(arr[j]<arr[minIndex]) {
				minIndex=j;
			}
		
		}
		int	temp=arr[i];
		arr[i]=arr[minIndex];
		arr[minIndex]=temp;
		System.out.println("Pass " + (i+1) + " :"  );
	for(int k=0;k<arr.length;k++) {
		   System.out.print(arr[k] + " ");
	}
	 System.out.println();
	}
	
}
}
