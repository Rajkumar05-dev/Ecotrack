package SelectionSort;

public class ArraySort {
public static void main(String[] args) {
	int arr[] = {29, 10, 14, 37, 13};

	for(int i=0;i<arr.length-1;i++) {
		for(int j=i+1;j<arr.length;j++) {
			 int minIndex = i;
			 if(arr[j]<arr[minIndex]) {
				 minIndex=j;
			 }
			 int temp=arr[i];
			 arr[i]=arr[minIndex];
			 arr[minIndex]=temp;
			
		}
	}

	for(int num:arr) {
		System.out.println(num);
	}
}
}
