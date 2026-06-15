package SelectionSort;

public class Descendingorder {
public static void main(String[] args) {
	int arr[] = {8, 3, 5, 1, 9};
	for(int i=0;i<arr.length-1;i++) {
		int minIndex=i;
		for(int j=i+1;j<arr.length;j++) {
			if(arr[j]>arr[minIndex]) {
				minIndex=j;
			}
		}
		int temp=arr[i];
		arr[i]=arr[minIndex];
		arr[minIndex]=temp;
	}
	for(int num:arr) {
		System.out.println(num);
	}
}
}
