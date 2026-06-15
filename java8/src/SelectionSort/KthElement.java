package SelectionSort;

public class KthElement {
public static void main(String[] args) {
	int arr[] = {64, 25, 12, 22, 11};
	for(int i=0;i<arr.length-1;i++) {
		int minIndex=i;
		for(int j=i+1;j<arr.length;j++) {
			if(arr[j]<arr[minIndex]) {
				minIndex=j;
			}
		}
		int temp=arr[i];
		arr[i]=arr[minIndex];
		arr[minIndex]=temp;
		if(i==1) {
			System.out.println("pass2 :");
			for(int k=0;k<arr.length;k++) {
				System.out.println(arr[k]);
			}
			
		}
		
		
	}
}
}
