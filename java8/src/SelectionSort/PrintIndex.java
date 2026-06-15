package SelectionSort;

public class PrintIndex {
public static void main(String[] args) {
	int arr[] = {4, 2, 7, 1, 9};
	for(int i=0;i<arr.length-1;i++) {
		int minIdex=i;
		for(int j=i+1;j<arr.length;j++) {
			if(arr[i]<arr[minIdex]) {
				minIdex=j;
			}
		}
		int temp=arr[i];
		arr[i]=arr[minIdex];
		arr[minIdex]=temp;
		System.out.println("Pass " + (i+1)  +" : " +minIdex);
	}
} 
}
