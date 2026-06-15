package StreamApi;

import java.util.Arrays;
import java.util.List;

public class Max {
public static void main(String[] args) {
	List<Integer> nums = Arrays.asList(10,20,5,40,15);
	Integer num = nums.stream().max(Integer::compare).get();
	System.out.println(num);

}
}
