package SortingAlgorithim;

public class first3largestelements {
public static void main(String[] args) {
	int arr[]={8,2,5,1,9,4};

	for(int i=0;i<arr.length-1;i++) {
		
		for(int j=0;j<arr.length-1-i;j++) {
		
			if(arr[j]>arr[j+1]) {
			
				int temp=arr[j];
				arr[j]=arr[j+1];
				arr[j+1]=temp;
			
			}
			
		}
	
	}
//	System.out.println(arr[arr.length-2]);
	for(int i=arr.length-1;i>arr.length-4;i--) {
		 System.out.print(arr[i] + " ");
	}
}
}
