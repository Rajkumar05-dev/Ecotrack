package SelectionSort;

public class TotalSwapsCount {
public static void main(String[] args) {
	int arr[] = {4, 2, 7, 1, 9};
	int swap=0;
	for(int i=0;i<arr.length-1;i++) {
		int minIdex=i;
		for(int j=i+1;j<arr.length;j++) {
			if(arr[j]<arr[minIdex]) {
				minIdex=j;
			}
			
		}
		if(minIdex!=i) {
			int temp=arr[i];
			arr[i]=arr[minIdex];
			arr[minIdex]=temp;
			swap++;
		}
	}
	System.out.println(swap); 
}
}
