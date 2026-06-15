package StreamApi;

import java.util.Arrays;
import java.util.List;


public class FindSecondSmallestNumber {
	public static void main(String[] args) {
		List<Integer> list = Arrays.asList(10, 20, 30, 40, 50);
		Integer secSmall = list.stream().distinct().sorted((a, b) -> a - b).skip(1).findFirst().orElse(null);
		System.out.println(secSmall); 
	}
}
