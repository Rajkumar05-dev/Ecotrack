package StreamApi;

import java.util.Arrays;
import java.util.List;

public class FindEvenNumbers {
public static void main(String[] args) {
	List<Integer> nums = Arrays .asList(1,2,3,4,5,6,7,8,9,10);
	List<Integer> evennumber = nums.stream().filter(n->n%2==0).toList();
	System.out.println(evennumber);
	

}
}
